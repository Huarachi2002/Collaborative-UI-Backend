import { IsBoolean, IsObject, IsOptional, IsString } from "class-validator";



export class CreateFlutterDto {

    @IsString()
    projectName: string;

    grapesJsData: any;
}