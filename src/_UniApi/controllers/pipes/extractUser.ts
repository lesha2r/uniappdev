import { Request } from 'express';
import { ObjectId } from 'bson'

interface ExtractedUser {
  user: any | null;
  workspace: ObjectId | null;
}

function extractUser(
  this: { serviceSettings?: { workspaceRequired?: boolean } },
  req: Request & { user?: { ws?: string } },
  METHOD_ID: string,
  strict: boolean = true
): ExtractedUser {
  const serviceSettings = this.serviceSettings || null;

  if (serviceSettings && serviceSettings.workspaceRequired === false) {
    return {
      user: null,
      workspace: null,
    };
  }

  const user = req.user;
  const workspaceStr = req.user?.ws;
  const workspaceObj = workspaceStr ? new ObjectId(workspaceStr) : null;
  const workspace = workspaceObj;

  if (strict && (!user || !workspace)) {
    throw new Error('Отсутствуют обязательные значения для Pipes.extractUser');
  }

  return {
    user,
    workspace,
  };
}

export default extractUser;