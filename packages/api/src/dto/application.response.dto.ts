import type { ApplicationModel, InterviewModel } from "@job-seekr/data/validation";

export type ApplicationResponseDto = {
    application: ApplicationModel;
    interviews: InterviewModel[];
}
