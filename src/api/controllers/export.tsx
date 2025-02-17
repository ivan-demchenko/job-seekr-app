import { Document, Page, Text, View, StyleSheet, render } from '@react-pdf/renderer';
import { Err, Ok, type Result } from 'neverthrow';
import { type InterviewsRepository } from '../repository/interviews';
import { type ApplicationsRepository } from '../repository/applications';
import type { ApplicationWithInterviewModel, InterviewModel } from '../../drivers/schemas';
import { printDate } from '../../utils';

// Create styles
const styles = StyleSheet.create({
  pageTitle: {
    fontWeight: 'bold',
  },
  pageDetails: {
    fontSize: '14px'
  },
  section: {
    margin: 10,
    padding: 10,
    fontWeight: 'bold'
  },
  position: {
    fontWeight: 'bold'
  },
  whenApplied: {
    color: '#555',
    fontSize: '13px',
    marginBottom: 5
  }
});

const MyDocument = (props: {
  applications: ApplicationWithInterviewModel[],
  interviews: InterviewModel[]
}) => (
  <Document>
    <Page size="A4">
      <View style={styles.section}>
        <Text style={styles.pageTitle}>My applications</Text>
        <Text style={styles.pageDetails}>Status as of {printDate()}</Text>
      </View>
      {props.applications.map(app => (
        <View key={app.id} style={styles.section}>
          <Text style={styles.position}>{app.position} @ {app.company}</Text>
          <Text style={styles.whenApplied}>Applied: {printDate(app.application_date)}</Text>
          <Text style={styles.position}>Interviews:</Text>
          {props.interviews.filter(rec => rec.application_id === app.id).map(interview => {
            return (
              <Text key={interview.id}>
                - {printDate(interview.interview_date)}: {interview.topic}
              </Text>
            )
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
  ) { }
  async generateReport(): Promise<Result<string, string>> {
    try {
      const filename = new Date().toISOString().substring(0, "yyyy-mm-dd".length);
      const filepath = `files/${filename}.pdf`;

      const applications = await this.applicationsRepository.getAllApplications();
      const interviews = await this.interviewsRepository.getAllInterviews();

      if (applications.isErr()) {
        return new Err(`PDF generation failed: ${applications.error}`);
      }

      if (interviews.isErr()) {
        return new Err(`PDF generation failed: ${interviews.error}`);
      }

      await render(<MyDocument applications={applications.value} interviews={interviews.value} />, filepath);
      return new Ok(filepath)
    } catch {
      return new Err(`PDF generation failed`);
    }
  }
}