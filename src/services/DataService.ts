import { User } from "../backend/user";
import { Group } from "../backend/group";
import { Task } from "../backend/task";
import { Challenge } from "../backend/challenge";
import { FriendRequest } from "../backend/friendRequest";

export class DataService {
  private static instance: DataService;
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

    grupo1.getUsers().push(user1, user2);
    grupo2.getUsers().push(user1, user3);
    grupo3.getUsers().push(user1, user4);
    user1.getGroups().push(grupo1, grupo2, grupo3);
    user2.getGroups().push(grupo1);
    user3.getGroups().push(grupo2);
    user4.getGroups().push(grupo3);

    const tarea1 = new Task(0, 2, "Comprar pan", "Comprar pan integral", new Date());
    const tarea2 = new Task(1, 1, "Limpiar cocina", "Dejar la cocina reluciente", new Date());
    const tarea3 = new Task(0, 3, "Pagar internet", "Pago mensual", new Date());
    grupo1.getTasks().push(tarea1, tarea2, tarea3);
    tarea1.getUsers().push(user1);
    tarea2.getUsers().push(user2);
    tarea3.getUsers().push(user1);

    const reto = new Challenge(0, 2, "Pasos", "Caminar 10000 pasos", new Date(), "10000 pasos", "Menos de 2000", 0, 10000);
    reto.setStatA(6000);
    grupo1.getTasks().push(reto);

    user1.getFriends().push(user2, user3);
    user2.getFriends().push(user1);
    user3.getFriends().push(user1);

    const request1 = new FriendRequest(user4.getId(), user1.getId());
    this.friendRequests = [request1];
  }
}