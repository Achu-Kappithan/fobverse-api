import { Injectable } from "@nestjs/common";
import { UserDocument } from "src/candidates/schema/candidate.schema"


export interface LoginResponce {
    accessToken: string
    refreshToken: string,
    userData: UserDocument | null
}

export interface RegisterResponce {
    user: UserDocument;
    message: string;
    verificationToken?: string
}

export interface verificatonResponce {
    message:string,
    user:UserDocument

}

export interface tokenresponce {
    newAccess:string,
    message:string
}


