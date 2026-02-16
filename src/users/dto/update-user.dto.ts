import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateUserDto {
  /**
   * l’update è stato reso "parziale":
   * se non si fornisce il `name`, NON viene modificato, resta invariato
   * altrimenti viene validato e in caso aggiornato
   */
  @IsOptional()
  @IsNotEmpty()
  name?: string;

  /**
   * stessa logica per l’email:
   * se non si fornisce, resta invariata
   * altrimenti viene validata e in caso aggiornata
   */
  @IsOptional()
  @IsEmail({}, { message: 'email must be a valid email address' })
  email?: string;
}
