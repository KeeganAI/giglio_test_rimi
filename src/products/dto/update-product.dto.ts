import { IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsNotEmpty({ message: 'Il nome non può essere vuoto.' })
  name?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Il prezzo deve essere un numero.' })
  @Min(0, { message: 'Il prezzo non può essere negativo.' })
  price?: number;
}
