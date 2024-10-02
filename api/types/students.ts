
export interface SetStudentQualificationsCommand {
	personId: string;
	qualificationIds: string[];
}

export interface QualificationDto {
	id: string;
	name: string;
}

export interface GetStudentWithQualificationsResponse {
	studentId: string;
	studentName: string;
	qualifications: QualificationDto[];
}