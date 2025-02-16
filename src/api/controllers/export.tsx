import { Document, Page, Text, View, StyleSheet, render } from '@react-pdf/renderer';
import { Err, Ok, type Result } from 'neverthrow';
import type { ApplicationsReadListModel } from '../../models/application';
import type { InterviewListModel } from '../../models/interviews';
import { getAllApplications } from './applications';
import { getAllInterviews } from '../repository/interviews';

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
  applications: ApplicationsReadListModel,
  interviews: InterviewListModel
}) => (
  <Document>
    <Page size="A4">
      <View style={styles.section}>
        <Text style={styles.pageTitle}>My applications</Text>
        <Text style={styles.pageDetails}>Status as of {new Date().toLocaleDateString()}</Text>
      </View>
      {props.applications.map(app => (
        <View key={app.id} style={styles.section}>
          <Text style={styles.position}>{app.position} @ {app.company}</Text>
          <Text style={styles.whenApplied}>Applied: {new Date(app.application_date).toLocaleDateString()}</Text>
          <Text style={styles.position}>Interviews:</Text>
          {props.interviews.filter(rec => rec.application_id === app.id).map(interview => {
            return (
              <Text key={interview.id}>
                - {new Date(interview.interview_date).toLocaleDateString()}: {interview.topic}
              </Text>
            )
          })}
        </View>
      ))}
    </Page>
  </Document>
);

export async function generateReport(): Promise<Result<string, string>> {
  try {
    const filename = new Date().toISOString().substring(0, "yyyy-mm-dd".length);
    const filepath = `files/${filename}.pdf`;

    const applications = getAllApplications();
    const interviews = getAllInterviews();

    if (interviews.isErr()) {
      return new Err(`PDF generation failed: ${interviews.error}`);
    }

    await render(<MyDocument applications={applications} interviews={interviews.value} />, filepath);
    return new Ok(filepath)
  } catch {
    return new Err(`PDF generation failed`);
  }
}