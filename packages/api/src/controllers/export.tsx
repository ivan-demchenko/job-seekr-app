import type {
  ApplicationListModel,
  InterviewModel,
} from "@job-seekr/data/validation";
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import { ResultAsync } from "neverthrow";
import type { ApplicationsRepository } from "../repository/applications";
import { AppError } from "../repository/app-error";
import type { InterviewsRepository } from "../repository/interviews";
import { printDate } from "../utils";

// Create styles
const styles = StyleSheet.create({
  pageTitle: {
    fontWeight: "bold",
    fontSize: "16px",
  },
  pageDetails: {
    fontSize: "14px",
  },
  section: {
    marginButton: 5,
    padding: 10,
    fontWeight: "bold",
  },
  position: {
    fontWeight: "bold",
  },
  interviews: {
    fontSize: "14px",
  },
  whenApplied: {
    color: "#555",
    fontSize: "13px",
    marginBottom: 5,
  },
  interviewNote: {
    fontSize: "14px",
  },
});

const MyDocument = (props: {
  applications: ApplicationListModel[];
  interviews: InterviewModel[];
}) => (
  <Document>
    <Page size="A4">
      <View style={styles.section}>
        <Text style={styles.pageTitle}>My applications</Text>
        <Text style={styles.pageDetails}>Status as of {printDate()}</Text>
      </View>
      {props.applications.map((app) => (
        <View key={app.id} style={styles.section}>
          <Text style={styles.position}>
            {app.position} @ {app.company}
          </Text>
          <Text style={styles.whenApplied}>
            Applied: {printDate(app.application_date)}
          </Text>
          <Text style={styles.interviews}>Interviews:</Text>
          {props.interviews
            .filter((rec) => rec.application_id === app.id)
            .map((interview) => {
              return (
                <Text key={interview.id} style={styles.interviewNote}>
                  - {printDate(interview.interview_date)}: {interview.topic}
                </Text>
              );
            })}
        </View>
      ))}
    </Page>
  </Document>
);

export class ExportController {
  constructor(
    private applicationsRepository: ApplicationsRepository,
    private interviewsRepository: InterviewsRepository,
  ) {}

  /**
   * Generates a PDF report of applications and interviews for a user.
   * @param userId - The ID of the user whose data is being exported.
   * @returns A `Result` containing the generated PDF buffer or an error message.
   */
  generateReport(
    userId: string,
  ): ResultAsync<Buffer<ArrayBufferLike>, AppError<'pdf-generation'>> {
    return ResultAsync.combine([
      this.applicationsRepository.getAllApplications(userId),
      this.interviewsRepository.getAllInterviews(),
    ])
    .mapErr(e => new AppError('pdf-generation', "Database issue", e))
    .andThen(([applications, interviews]) =>
      ResultAsync.fromPromise(
        renderToBuffer(
          <MyDocument applications={applications} interviews={interviews} />,
        ),
        (e) => new AppError('pdf-generation', "PDF generation failed", e),
      ),
    );
  }
}
