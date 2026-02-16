import { ArrayMinSize, IsArray, IsInt, Min } from 'class-validator';

export class CreateOrderDto {
  @IsInt({ message: 'userId deve essere un intero.' })
  @Min(1, { message: 'userId non valido.' })
  userId!: number;

  @IsArray({ message: 'productIds deve essere un array.' })
  @ArrayMinSize(1, { message: 'productIds deve contenere almeno un elemento.' })
  @IsInt({ each: true, message: 'productIds deve contenere solo interi.' })
  productIds!: number[];
}
