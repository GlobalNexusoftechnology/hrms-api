import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EmployeeDocument } from "./entities/employee-document.entity";
import { Employee } from "../employees/entities/employee.entity";
import { EmployeeDocumentsController } from "./employee-documents.controller";
import { EmployeeDocumentsService } from "./employee-documents.service";

@Module({
  imports: [TypeOrmModule.forFeature([EmployeeDocument, Employee])],

  controllers: [EmployeeDocumentsController],

  providers: [EmployeeDocumentsService],

  exports: [EmployeeDocumentsService],
})
export class EmployeeDocumentsModule {}
