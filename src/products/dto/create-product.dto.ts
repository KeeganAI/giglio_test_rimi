import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty({ message: 'Il nome è obbligatorio.' })
  name!: string;

  @IsNotEmpty({ message: 'Il prezzo è obbligatorio.' }) // facoltativo?
  @IsNumber({}, { message: 'Il prezzo deve essere un numero.' })
  @Min(0, { message: 'Il prezzo non può essere negativo.' })
  price!: number;
}
