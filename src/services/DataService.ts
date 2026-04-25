import { User } from "../backend/user";
import { Group } from "../backend/group";
import { Task } from "../backend/task";
import { Challenge } from "../backend/challenge";
import { FriendRequest } from "../backend/friendRequest";

type Listener = () => void;

export class DataService {
  private static instance: DataService;
  private listeners: Listener[] = [];

  currentUser: User | null = null;
  users: User[] = [];
  groups: Group[] = [];
  friendRequests: FriendRequest[] = [];

  private constructor() {
    this.seedData();
  }

  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  // Suscripción a cambios (pública)
  subscribe(listener: Listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Emitir cambios para forzar actualizaciones (ahora pública para P2P)
  emit = () => {
    this.listeners.forEach(l => l());
  };

  private seedData() {
    const user1 = new User("Usuario", "pass123", "Gestor de tareas y colaborador en múltiples gremios de convivencia.");
    const user2 = new User("Ana", "pass123", "Aventurera experta.");
    const user3 = new User("Bruno", "pass123", "Caballero de la cocina.");
    const user4 = new User("Carlos", "pass123", "Explorador de gimnasios.");
    this.users = [user1, user2, user3, user4];
    this.currentUser = user1;

    const grupo1 = new Group("Piso 4", "Gestión de tareas del hogar y gastos comunes.");
    const grupo2 = new Group("Viaje Verano", "Planificación del viaje a la costa en Agosto.");
    const grupo3 = new Group("Gym Friends", "Seguimiento de entrenamientos y retos fitness.");
    this.groups = [grupo1, grupo2, grupo3];

    grupo1.Users.push(user1, user2);
    grupo2.Users.push(user1, user3);
    grupo3.Users.push(user1, user4);
    user1.Groups.push(grupo1, grupo2, grupo3);
    user2.Groups.push(grupo1);
    user3.Groups.push(grupo2);
    user4.Groups.push(grupo3);

    const tarea1 = new Task(0, 2, "Comprar pan", "Comprar pan integral", new Date());
    const tarea2 = new Task(1, 1, "Limpiar cocina", "Dejar la cocina reluciente", new Date());
    const tarea3 = new Task(0, 3, "Pagar internet", "Pago mensual", new Date());
    grupo1.Tasks.push(tarea1, tarea2, tarea3);
    tarea1.Users.push(user1);
    tarea2.Users.push(user2);
    tarea3.Users.push(user1);

    const reto = new Challenge(0, 2, "Pasos", "Caminar 10000 pasos", new Date(), "10000 pasos", "Menos de 2000", 0, 10000);
    reto.StatA = 6000;
    grupo1.Tasks.push(reto);

    user1.Friends.push(user2, user3);
    user2.Friends.push(user1);
    user3.Friends.push(user1);

    const request1 = new FriendRequest(user4.Id, user1.Id);
    this.friendRequests = [request1];
  }

  addGroup(group: Group) {
    this.groups.push(group);
    this.currentUser?.Groups.push(group);
    this.emit();
  }

  toggleTask(taskId: number, groupId?: number) {
    const tasks = groupId
      ? this.groups.find(g => g.Id === groupId)?.Tasks ?? []
      : this.groups.flatMap(g => g.Tasks);
    tasks.forEach(t => {
      if (t.Id === taskId) {
        t.Checked = t.Checked === 1 ? 0 : 1;
      }
    });
    this.emit();
  }

  removeFriend(userId: number) {
    if (!this.currentUser) return;
    const friends = this.currentUser.Friends;
    const updated = friends.filter(f => f.Id !== userId);
    friends.length = 0;
    updated.forEach(f => friends.push(f));
    this.emit();
  }

  sendFriendRequest(targetUser: User) {
    if (!this.currentUser) return;
    const req = new FriendRequest(this.currentUser.Id, targetUser.Id);
    this.friendRequests.push(req);
    this.emit();
  }

  acceptFriendRequest(reqId: number) {
    const req = this.friendRequests.find(r => r.Id === reqId);
    if (req) {
      req.Accepted = true;
      const srcUser = this.users.find(u => u.Id === req.IdUserSrc);
      const destUser = this.users.find(u => u.Id === req.IdUserDest);
      if (srcUser && destUser && !srcUser.Friends.some(f => f.Id === destUser.Id)) {
        srcUser.Friends.push(destUser);
        destUser.Friends.push(srcUser);
      }
      this.friendRequests = this.friendRequests.filter(r => r.Id !== reqId);
      this.emit();
    }
  }
}