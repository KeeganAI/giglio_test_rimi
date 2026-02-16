import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  /** obbligatorio */
  @IsNotEmpty({ message: "Il nome non può essere vuoto." })
  //@IsNotEmpty() //errore di default
  name!: string;

  /** obbligatorio e deve essere email valida */
  @IsEmail({}, { message: 'L\'email non è valida.' })
  email!: string;
}
