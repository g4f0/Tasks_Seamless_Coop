import { User } from "../backend/user";
import { Group } from "../backend/group";
import { Task } from "../backend/task";
import { Challenge } from "../backend/challenge";
import { FriendRequest } from "../backend/friendRequest";
import { Event } from "../backend/event";

type Listener = () => void;

type TaskType = "Task" | "Challenge" | "Event";

type TaskDTO = {
  id: number;
  checked: number;
  priority: number;
  endDate: string;
  name: string;
  description: string;
  userIds: number[];
  type: TaskType;
  winCondition?: string;
  loseCondition?: string;
  statA?: number;
  statB?: number;
};

type GroupDTO = {
  id: number;
  name: string;
  description: string;
  userIds: number[];
  tasks: TaskDTO[];
};

type UserDTO = {
  id: number;
  name: string;
  password: string;
  description: string;
  friendIds: number[];
  groupIds: number[];
};

type FriendRequestDTO = {
  id: number;
  idUserSrc: number;
  idUserDest: number;
  accepted: boolean;
};

export interface AppSnapshot {
  currentUserId: number | null;
  users: UserDTO[];
  groups: GroupDTO[];
  friendRequests: FriendRequestDTO[];
}

export class DataService {
  private static instance: DataService;
  private listeners: Listener[] = [];

  currentUser: User | null = null;
  users: User[] = [];
  groups: Group[] = [];
  friendRequests: FriendRequest[] = [];

  public isApplyingRemoteUpdate = false;

  private readonly STORAGE_KEY = "tsc-state-v1";
  private readonly CURRENT_USER_KEY = "tsc-current-user-id";

  private constructor() {
    const loaded = this.loadFromStorage();
    if (!loaded) this.seedData();

    // Restaurar usuario actual explícitamente (si existe)
    const savedUid = localStorage.getItem(this.CURRENT_USER_KEY);
    if (savedUid) {
      const uid = Number(savedUid);
      this.currentUser = this.users.find(u => u.Id === uid) ?? this.currentUser;
    }

    // Si no hay currentUser pero snapshot ya lo tenía, persistir clave auxiliar
    if (this.currentUser) {
      localStorage.setItem(this.CURRENT_USER_KEY, String(this.currentUser.Id));
    }
  }

  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  subscribe(listener: Listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  emit = () => {
    this.saveToStorage();
    if (this.currentUser) {
      localStorage.setItem(this.CURRENT_USER_KEY, String(this.currentUser.Id));
    } else {
      localStorage.removeItem(this.CURRENT_USER_KEY);
    }
    this.listeners.forEach(l => l());
  };

  private saveToStorage() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.exportSnapshot()));
    } catch {
      // noop
    }
  }

  private loadFromStorage(): boolean {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return false;
      const snap = JSON.parse(raw) as AppSnapshot;
      this.replaceStateFromSnapshot(snap);
      return true;
    } catch {
      return false;
    }
  }

  private seedData() {
    const user1 = new User("Usuario", "pass123", "Gestor de tareas y colaborador en múltiples gremios de convivencia.");
    const user2 = new User("Ana", "pass123", "Aventurera experta.");
    const user3 = new User("Bruno", "pass123", "Caballero de la cocina.");
    const user4 = new User("Carlos", "pass123", "Explorador de gimnasios.");
    this.users = [user1, user2, user3, user4];
    this.currentUser = null;

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
    const evento = new Event(2, "Reunión de piso", "Organizar limpieza mensual", new Date(Date.now() + 2 * 24 * 60 * 60 * 1000));

    grupo1.Tasks.push(tarea1, tarea2, tarea3, evento);
    tarea1.Users.push(user1);
    tarea2.Users.push(user2);
    tarea3.Users.push(user1);
    evento.Users.push(user1, user2);

    const reto = new Challenge(0, 2, "Pasos", "Caminar 10000 pasos", new Date(), "10000 pasos", "Menos de 2000", 6000, 10000);
    grupo1.Tasks.push(reto);

    user1.Friends.push(user2, user3);
    user2.Friends.push(user1);
    user3.Friends.push(user1);

    const request1 = new FriendRequest(user4.Id, user1.Id);
    this.friendRequests = [request1];

    this.saveToStorage();
  }

  exportSnapshot(): AppSnapshot {
    return {
      currentUserId: this.currentUser?.Id ?? null,
      users: this.users.map(u => ({
        id: u.Id,
        name: u.Name,
        password: u.Password,
        description: u.Description,
        friendIds: u.Friends.map(f => f.Id),
        groupIds: u.Groups.map(g => g.Id),
      })),
      groups: this.groups.map(g => ({
        id: g.Id,
        name: g.Name,
        description: g.Description,
        userIds: g.Users.map(u => u.Id),
        tasks: g.Tasks.map(t => {
          let type: TaskType = "Task";
          if (t instanceof Challenge) type = "Challenge";
          else if (t instanceof Event) type = "Event";

          const base: TaskDTO = {
            id: t.Id,
            checked: t.Checked,
            priority: t.Priority,
            endDate: t.EndDate.toISOString(),
            name: t.Name,
            description: t.Description,
            userIds: t.Users.map(u => u.Id),
            type,
          };

          if (t instanceof Challenge) {
            base.winCondition = t.WinCondition;
            base.loseCondition = t.LoseCondition;
            base.statA = t.StatA;
            base.statB = t.StatB;
          }
          return base;
        }),
      })),
      friendRequests: this.friendRequests.map(r => ({
        id: r.Id,
        idUserSrc: r.IdUserSrc,
        idUserDest: r.IdUserDest,
        accepted: r.Accepted,
      })),
    };
  }

  replaceStateFromSnapshot(snapshot: AppSnapshot) {
    this.isApplyingRemoteUpdate = true;
    try {
      const userMap = new Map<number, User>();
      for (const u of snapshot.users) {
        const user = new User(u.name, u.password, u.description);
        userMap.set(u.id, user);
      }

      const groupMap = new Map<number, Group>();
      for (const g of snapshot.groups) {
        const group = new Group(g.name, g.description);

        const tasks: Task[] = g.tasks.map(t => {
          if (t.type === "Challenge") {
            return new Challenge(
              t.checked,
              t.priority,
              t.name,
              t.description,
              new Date(t.endDate),
              t.winCondition ?? "",
              t.loseCondition ?? "",
              t.statA ?? 0,
              t.statB ?? 0
            );
          }
          if (t.type === "Event") {
            return new Event(t.priority, t.name, t.description, new Date(t.endDate));
          }
          return new Task(t.checked, t.priority, t.name, t.description, new Date(t.endDate));
        });

        group.Tasks = tasks;
        groupMap.set(g.id, group);
      }

      snapshot.groups.forEach(g => {
        const group = groupMap.get(g.id)!;
        group.Users = g.userIds.map(uid => userMap.get(uid)!).filter(Boolean);

        g.tasks.forEach((taskDTO, index) => {
          const task = group.Tasks[index];
          if (task) {
            task.Users = taskDTO.userIds.map(uid => userMap.get(uid)!).filter(Boolean);
          }
        });
      });

      snapshot.users.forEach(u => {
        const user = userMap.get(u.id)!;
        user.Friends = u.friendIds.map(fid => userMap.get(fid)!).filter(Boolean);
        user.Groups = u.groupIds.map(gid => groupMap.get(gid)!).filter(Boolean);
      });

      const requests = snapshot.friendRequests.map(r => {
        const fr = new FriendRequest(r.idUserSrc, r.idUserDest);
        fr.Accepted = r.accepted;
        return fr;
      });

      this.users = Array.from(userMap.values());
      this.groups = Array.from(groupMap.values());
      this.friendRequests = requests;
      this.currentUser = snapshot.currentUserId !== null ? (userMap.get(snapshot.currentUserId) ?? null) : null;

      this.emit();
    } finally {
      this.isApplyingRemoteUpdate = false;
    }
  }

  login(nameOrEmail: string, password: string): boolean {
    const normalized = nameOrEmail.trim().toLowerCase();
    const user = this.users.find(
      u => u.Name.toLowerCase() === normalized || `${u.Name.toLowerCase()}@ejemplo.com` === normalized
    );
    if (!user || user.Password !== password) return false;
    this.currentUser = user;
    localStorage.setItem(this.CURRENT_USER_KEY, String(user.Id));
    this.emit();
    return true;
  }

  register(name: string, password: string): boolean {
    const normalized = name.trim().toLowerCase();
    if (!name.trim() || !password.trim()) return false;
    if (this.users.some(u => u.Name.toLowerCase() === normalized)) return false;
    const user = new User(name.trim(), password, "Nuevo aventurero.");
    this.users.push(user);
    this.currentUser = user;
    localStorage.setItem(this.CURRENT_USER_KEY, String(user.Id));
    this.emit();
    return true;
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem(this.CURRENT_USER_KEY);
    this.emit();
  }

  addGroup(group: Group) {
    this.groups.push(group);
    this.currentUser?.Groups.push(group);
    this.emit();
  }

  addTaskToGroup(groupId: number, payload: { name: string; description: string; priority: number; endDate: Date }) {
    const group = this.groups.find(g => g.Id === groupId);
    if (!group) return;
    const task = new Task(0, payload.priority, payload.name, payload.description, payload.endDate);
    if (this.currentUser) task.Users.push(this.currentUser);
    group.Tasks.push(task);
    this.emit();
  }

  addEventToGroup(groupId: number, payload: { name: string; description: string; priority: number; endDate: Date }) {
    const group = this.groups.find(g => g.Id === groupId);
    if (!group) return;
    const ev = new Event(payload.priority, payload.name, payload.description, payload.endDate);
    if (this.currentUser) ev.Users.push(this.currentUser);
    group.Tasks.push(ev);
    this.emit();
  }

  addChallengeToGroup(
    groupId: number,
    payload: {
      name: string;
      description: string;
      priority: number;
      endDate: Date;
      winCondition: string;
      loseCondition: string;
      statA: number;
      statB: number;
    }
  ) {
    const group = this.groups.find(g => g.Id === groupId);
    if (!group) return;
    const ch = new Challenge(
      0,
      payload.priority,
      payload.name,
      payload.description,
      payload.endDate,
      payload.winCondition,
      payload.loseCondition,
      payload.statA,
      payload.statB
    );
    if (this.currentUser) ch.Users.push(this.currentUser);
    group.Tasks.push(ch);
    this.emit();
  }

  toggleTask(taskId: number, groupId?: number) {
    const tasks = groupId
      ? this.groups.find(g => g.Id === groupId)?.Tasks ?? []
      : this.groups.flatMap(g => g.Tasks);

    tasks.forEach(t => {
      if (t.Id === taskId) {
        if (t instanceof Event) return; // Evento no checkeable manualmente
        t.Checked = t.Checked === 1 ? 0 : 1;
      }
    });
    this.emit();
  }

  removeFriend(userId: number) {
    if (!this.currentUser) return;
    const me = this.currentUser;
    const other = this.users.find(u => u.Id === userId);

    me.Friends = me.Friends.filter(f => f.Id !== userId);
    if (other) other.Friends = other.Friends.filter(f => f.Id !== me.Id);

    this.emit();
  }

  sendFriendRequest(targetUser: User): { ok: boolean; message: string } {
    if (!this.currentUser) return { ok: false, message: "Debes iniciar sesión." };
    if (targetUser.Id === this.currentUser.Id) return { ok: false, message: "No puedes añadirte a ti mismo." };
    if (this.currentUser.Friends.some(f => f.Id === targetUser.Id)) {
      return { ok: false, message: "Ya sois amigos." };
    }

    const duplicate = this.friendRequests.some(
      r =>
        (r.IdUserSrc === this.currentUser!.Id && r.IdUserDest === targetUser.Id) ||
        (r.IdUserSrc === targetUser.Id && r.IdUserDest === this.currentUser!.Id)
    );
    if (duplicate) return { ok: false, message: "Ya existe una solicitud pendiente." };

    const req = new FriendRequest(this.currentUser.Id, targetUser.Id);
    this.friendRequests.push(req);
    this.emit();
    return { ok: true, message: "Solicitud enviada." };
  }

  rejectFriendRequest(reqId: number) {
    this.friendRequests = this.friendRequests.filter(r => r.Id !== reqId);
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
