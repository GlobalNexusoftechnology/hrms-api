import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { AddressTypeEnum } from '../../../common/enums/address-type.enum';

export class CreateEmployeeAddressDto {
  @IsEnum(AddressTypeEnum)
  type!: AddressTypeEnum;

  @IsString()
  @IsNotEmpty()
  address1!: string;

  @IsOptional()
  @IsString()
  address2?: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsString()
  @IsNotEmpty()
  state!: string;

  @IsString()
  @IsNotEmpty()
  country!: string;

  @IsString()
  @IsNotEmpty()
  postalCode!: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
