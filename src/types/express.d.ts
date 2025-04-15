import { NextFunction, Request, Response } from 'express';

interface TReqCustom {
    __uniAuth?: {
        authed: boolean,
        user: {
            _id: string;
            workspace: string;
            session: string;
            email: string;
            tokens: {
                access: string;
            };
            [key: string]: any;
        };
        workspace?: string;
    }
}

type TReq = Request & TReqCustom
type TReqAuthed = Request & TReqCustomAuthed;
type TRes = Response;
type TNext = NextFunction;