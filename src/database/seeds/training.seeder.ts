import { DataSource } from 'typeorm';
import { Department } from '../../modules/departments/entities/department.entity';
import { Employee } from '../../modules/employees/entities/employee.entity';
import { RoleEnum } from '../../common/enums/role.enum';
import { Course } from '../../modules/training/entities/course.entity';
import { CourseModule } from '../../modules/training/entities/course-module.entity';
import { CourseTopic } from '../../modules/training/entities/course-topic.entity';
import { CourseMaterial } from '../../modules/training/entities/course-material.entity';
import { Assessment } from '../../modules/training/entities/assessment.entity';
import { AssessmentQuestion } from '../../modules/training/entities/assessment-question.entity';
import { AssessmentOption } from '../../modules/training/entities/assessment-option.entity';
import { TrainingMaterialTypeEnum } from '../../common/enums/training-material-type.enum';

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const seedTraining = async (dataSource: DataSource) => {
  const departmentRepo = dataSource.getRepository(Department);
  const employeeRepo = dataSource.getRepository(Employee);
  
  const courseRepo = dataSource.getRepository(Course);
  const moduleRepo = dataSource.getRepository(CourseModule);
  const topicRepo = dataSource.getRepository(CourseTopic);
  const materialRepo = dataSource.getRepository(CourseMaterial);
  const assessmentRepo = dataSource.getRepository(Assessment);
  const questionRepo = dataSource.getRepository(AssessmentQuestion);
  const optionRepo = dataSource.getRepository(AssessmentOption);

  const hrEmployee = await employeeRepo.findOne({
    where: { role: { name: RoleEnum.HR } },
    relations: { role: true },
  });

  if (!hrEmployee) {
    console.log('No HR employee found, skipping training seed.');
    return;
  }

  const departments = await departmentRepo.find();
  if (departments.length === 0) return;

  const existingCourses = await courseRepo.count();
  if (existingCourses > 0) {
    console.log('Courses already seeded. Skipping training seed.');
    return;
  }

  console.log('Seeding massive training data...');

  for (const department of departments) {
    const numCourses = getRandomInt(3, 4);
    
    for (let c = 1; c <= numCourses; c++) {
      const course = await courseRepo.save({
        title: `${department.name} Mastery Course ${c}`,
        description: `Comprehensive training ${c} for the ${department.name} department.`,
        departmentId: department.id,
        createdBy: hrEmployee.id,
        isActive: true,
      });

      const numModules = getRandomInt(3, 4);
      for (let m = 1; m <= numModules; m++) {
        const module = await moduleRepo.save({
          courseId: course.id,
          title: `${department.name} - Module ${m}: Fundamentals`,
          description: `Core concepts of ${department.name} part ${m}`,
          sortOrder: m,
        });

        const numTopics = getRandomInt(3, 4);
        for (let t = 1; t <= numTopics; t++) {
          const topic = await topicRepo.save({
            moduleId: module.id,
            title: `${department.name} - Topic ${t}: Deep Dive`,
            description: `Learning ${department.name} topic ${t}`,
            sortOrder: t,
          });

          const numMaterials = getRandomInt(3, 4);
          for (let mat = 1; mat <= numMaterials; mat++) {
            const types = [TrainingMaterialTypeEnum.DOCUMENT, TrainingMaterialTypeEnum.VIDEO, TrainingMaterialTypeEnum.LINK];
            const type = types[getRandomInt(0, types.length - 1)];
            
            await materialRepo.save({
              topicId: topic.id,
              title: `${department.name} - Resource ${mat}`,
              type,
              fileUrl: type === TrainingMaterialTypeEnum.LINK ? 'https://example.com' : 'https://example.com/file.pdf',
              sortOrder: mat,
            });
          }
        }

        const assessment = await assessmentRepo.save({
          moduleId: module.id,
          title: `${department.name} - Module ${m} Assessment`,
          passingPercentage: 50,
        });

        const numQuestions = getRandomInt(5, 8);
        for (let q = 1; q <= numQuestions; q++) {
          const question = await questionRepo.save({
            assessmentId: assessment.id,
            questionText: `Sample ${department.name} question ${q} for Module ${m}?`,
            sortOrder: q,
          });

          const correctOptionIndex = getRandomInt(1, 4);
          const options: any[] = [];
          for (let opt = 1; opt <= 4; opt++) {
            options.push({
              questionId: question.id,
              optionText: `Option ${opt} for Q${q}`,
              isCorrect: opt === correctOptionIndex,
              sortOrder: opt,
            });
          }
          await optionRepo.save(options);
        }
      }
    }
  }

  console.log('LMS Courses seeded successfully.');
};
