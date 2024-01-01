"use server";
import { validate } from "uuid";
import { files, folders, users, workspaces } from "../../../migrations/schema";
import { File, Folder, Subscription, User, workspace } from "./supabase.types";
import { and, eq, ilike, notExists } from "drizzle-orm";
import db from "./db";
import { collaborators } from "./schema";
import { revalidatePath } from "next/cache";

export const getUserSubscriptionStatus = async (userId: string) => {
  try {
    const data = await db.query.subscriptions.findFirst({
      where: (s, { eq }) => eq(s.userId, userId),
    });
    if (data) return { data: data as Subscription, error: null };
    else return { data: null, error: null };
  } catch (error) {
    console.log(error);
    return { data: null, error: `Error` };
  }
};


//workspaces
export const createWorkspace = async (workspace: workspace) => {
  try {
    const response = await db.insert(workspaces).values(workspace);
    return { data: null, error: null };
  } catch (error) {
    console.log(error);
    return { data: null, error: "Error" };
  }
};

export const getWorkspaceDetails = async (workspaceId: string) => {
  const isValid = validate(workspaceId);
  if (!isValid) return { data: null, error: "Error" };
  try {
    const results = (await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId))) as workspace[] | [];
    return { data: results, error: null };
  } catch (error) {
    console.log(error);
    return { data: null, error: "Error" };
  }
};

export const getPrivateWorkspaces = async (userId: string) => {
  if (!userId) return [];

  const privateWorkSpaces = await db
    .select({
      id: workspaces.id,
      title: workspaces.title,
      iconId: workspaces.iconId,
      data: workspaces.data,
      inTrash: workspaces.inTrash,
      logo: workspaces.logo,
      workspaceOwner: workspaces.workspaceOwner,
      createdAt: workspaces.createdAt,
      bannerUrl: workspaces.bannerUrl,
    })
    .from(workspaces)
    .where(
      and(
        notExists(
          db
            .select()
            .from(collaborators)
            .where(eq(collaborators.workspaceId, workspaces.id))
        ),
        eq(workspaces.workspaceOwner, userId)
      )
    ) as workspace[];


    return privateWorkSpaces;
};

export const getCollaboratingWorkspaces = async (userId: string) => {
  if (!userId) return []; 

  const collaboratingWorkspaces = await db.select(
    {
      id: workspaces.id,
      title: workspaces.title,
      iconId: workspaces.iconId,
      data: workspaces.data,
      inTrash: workspaces.inTrash,
      logo: workspaces.logo,
      workspaceOwner: workspaces.workspaceOwner,
      createdAt: workspaces.createdAt,
      bannerUrl: workspaces.bannerUrl,
    }
  ).from(users)
  .innerJoin(collaborators,eq(collaborators.userId, users.id))
  .innerJoin(workspaces, eq(collaborators.workspaceId, workspaces.id))
  .where(eq(users.id, userId)) as workspace[];

  return collaboratingWorkspaces;
}

export const getSharedWorkspaces = async (userId: string) => {
  if (!userId) return []; 
  const sharedWorkspaces = await db.selectDistinct(
    {
      id: workspaces.id,
      title: workspaces.title,
      iconId: workspaces.iconId,
      data: workspaces.data,
      inTrash: workspaces.inTrash,
      logo: workspaces.logo,
      workspaceOwner: workspaces.workspaceOwner,
      createdAt: workspaces.createdAt,
      bannerUrl: workspaces.bannerUrl,
    }
  ).from(workspaces)
  .orderBy(workspaces.createdAt)
  // .innerJoin(collaborators,eq(collaborators.userId, users.id))
  .innerJoin(collaborators, eq(collaborators.workspaceId, workspaces.id))
  .where(eq(workspaces.workspaceOwner, userId)) as workspace[];

  return sharedWorkspaces;

}

export const updateWorkspace = async (workspace : Partial<workspace>, workspaceId : string) => {
  try {
    await db.update(workspaces).set(workspace).where(eq(workspaces.id, workspaceId));
    return {data:null, error:null}
    
  } catch (error) {
    console.log(error);
    return {data:null, error:"Error"}
    
  }
}

export const deleteWorkspace = async (workspaceId : string) => {
  try {
    await db.delete(workspaces).where(eq(workspaces.id, workspaceId));
    return {data:null, error:null}
    
  } catch (error) {
    console.log(error);
    return {data:null, error:"Error"}
    
  }
}


//collaborators
export const getCollaborators = async (workspaceId: string) => {
  const response = await db
    .select()
    .from(collaborators)
    .where(eq(collaborators.workspaceId, workspaceId));
  if (!response.length) return [];
  const userInformation: Promise<User | undefined>[] = response.map(
    async (user) => {
      const exists = await db.query.users.findFirst({
        where: (u, { eq }) => eq(u.id, user.userId),
      });
      return exists;
    }
  );
  const resolvedUsers = await Promise.all(userInformation);
  return resolvedUsers.filter(Boolean) as User[];
};

export const addCollaborators = async (users : User[], workspaceId : string) => {
  const response  = users.forEach(
    async (user : User) => {
      const userExists = await db.query.collaborators.findFirst({
        where : (u,{eq}) => and(eq(u.userId, user.id), eq(u.workspaceId, workspaceId))
      })

      if (userExists) return;
      await db.insert(collaborators).values({
        userId : user.id,
        workspaceId : workspaceId
      })
    }
  )
}

export const removeCollaborators = async (users : User[], workspaceId : string) => {
  const response  = users.forEach(
    async (user : User) => {
      const userExists = await db.query.collaborators.findFirst({
        where : (u,{eq}) => and(eq(u.userId, user.id), eq(u.workspaceId, workspaceId))
      })

      if (userExists) 
      await db.delete(collaborators).where(
        and(
          eq(collaborators.userId, user.id),
          eq(collaborators.workspaceId, workspaceId)
        )
      )
    }
  )
}

export const findUser = async(userId : string) => {
  const response = await db.query.users.findFirst({
    where : (u,{eq}) => eq(u.id, userId)
  })

  return response;
}

export const updateuser = async (user : Partial<User>, userId : string) => {
  try {
    await db.update(users).set(user).where(eq(users.id, userId));
    return {data:null, error:null}
    
  } catch (error) {
    console.log(error);
    return {data:null, error:"Error"}
    
  }
}


//folders

export const getFolders = async (workspaceId: string) => {
  const isValid = validate(workspaceId);
  if (!isValid) return { data: null, error: "Error" };
  try {
    const results: Folder[] | [] = await db
      .select()
      .from(folders)
      .orderBy(folders.createdAt)
      .where(eq(folders.workspaceId, workspaceId));
    return { data: results, error: null };
  } catch (error) {
    console.log(error);
    return { data: null, error: "Error" };
  }
};

export const createNewFolder = async ( folder: Folder) => {
  try {
    const response = await db.insert(folders).values(folder);
    return { data: null, error: null };
  } catch (error) {
    console.log(error);
    return { data: null, error: "Error" };
  }

}

export const updateFolder = async(folder : Partial<Folder>, folderId : string) => {
  try {
    await db.update(folders).set(folder).where(eq(folders.id, folderId));
    return {data:null, error:null}
    
  } catch (error) {
    console.log(error);
    return {data:null, error:"Error"}
    
  }
}

export const deleteFolder = async (folderId : string) => {
  try {
    await db.delete(folders).where(eq(folders.id, folderId));
    return {data:null, error:null}
    
  } catch (error) {
    console.log(error);
    return {data:null, error:"Error"}
    
  }
}

export const getFolderDetails = async (folderId : string) => {
  const isValid = validate(folderId);
  if (!isValid) return { data: null, error: "Error" };
  try {
    const results = (await db
      .select()
      .from(folders)
      .orderBy(folders.createdAt)
      .where(eq(folders.id, folderId))) as Folder[] | [];
    return { data: results, error: null };
  } catch (error) {
    console.log(error);
    return { data: null, error: "Error" };
  }
}

//files
export const getFiles = async (folderId: string) => {
  const isValid = validate(folderId);
  if (!isValid) return { data: null, error: "Error" };
  try {
    const results = (await db
      .select()
      .from(files)
      .orderBy(files.createdAt)
      .where(eq(files.folderId, folderId))) as File[] | [];
    return { data: results, error: null };
  } catch (error) {
    console.log(error);
    return { data: null, error: "Error" };
  }
};

export const createNewFile = async (file : File) => {
  try {
    const response = await db.insert(files).values(file);
    return { data: null, error: null };
  } catch (error) {
    console.log(error);
    return { data: null, error: "Error" };
  }
}

export const updateFile = async (file : Partial<File>, fileId : string) => {
  try {
    await db.update(files).set(file).where(eq(files.id, fileId));
    return {data:null, error:null}
    
  } catch (error) {
    console.log(error);
    return {data:null, error:"Error"}
    
  }
}

export const deleteFile = async ( fileId : string) => {
  try {
    await db.delete(files).where(eq(files.id, fileId));
    return {data:null, error:null}
    
  } catch (error) {
    console.log(error);
    return {data:null, error:"Error"}
    
  }
}

export const getFileDetails = async (fileId : string) => {
  const isValid = validate(fileId);
  if (!isValid) return { data: null, error: "Error" };
  try {
    const results = (await db
      .select()
      .from(files)
      .orderBy(files.createdAt)
      .where(eq(files.id, fileId))) as File[] | [];
    return { data: results, error: null };
  } catch (error) {
    console.log(error);
    return { data: null, error: "Error" };
  }
}


//misc
export const getUsersFromSearch = async (email : string) => {
  if (!email) return [];

  const accounts = db.select().from(users).where(ilike(users.email, `%${email}%`)) ;

  return accounts;

}


export const getActiveProductsWithPrice = async () => {
  try {
    const res = await db.query.products.findMany({
      where: (pro, { eq }) => eq(pro.active, true),
      with: {
        prices: {
          where: (pri, { eq }) => eq(pri.active, true),
        },
      },
    });
    if (res.length) return { data: res, error: null };
    return { data: [], error: null };
  } catch (error) {
    console.log(error);
    return { data: [], error };
  }
};
