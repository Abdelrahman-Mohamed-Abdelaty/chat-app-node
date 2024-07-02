export class Users{
    private users: any[];
    constructor() {
        this.users=[];
    }
    addUser(id:string,name:string,room:string){
        const user={id,name,room};
        this.users.push(user);
        return user;
    }
    getUserList(room:string){
        return this.users
            .filter((user) => user.room === room)
            .map((user) => user.name);
    }
    getUser(id:string){
        return this.users.filter((user)=>user.id===id)[0];
    }
    removeUser(id:string){
        const user= this.getUser(id);
        if(user){
            this.users=this.users.filter((user)=>user.id !== id);
        }
        return user;
    }
}