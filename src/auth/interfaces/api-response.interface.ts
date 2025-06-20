import { Injectable } from "@nestjs/common";
import { UserDocument } from "src/candidates/schema/candidate.schema"


export interface LoginResponce {
    accessToken: string
    refreshToken: string,
    user: UserDocument
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

