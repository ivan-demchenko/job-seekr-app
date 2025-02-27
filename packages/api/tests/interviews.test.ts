import { describe, test, expect, beforeAll } from 'bun:test';
import { app } from '../src/main';

describe('Interviews', () => {
  let applicationId: string | null = null;

  beforeAll(async () => {
    if (applicationId) {
      return applicationId;
    }
    const marker = Date.now();
    const postRes = await app.request('/api/applications', {
      method: 'POST',
      body: JSON.stringify({
        company: `Test company ${marker}`,
        position: `Test position ${marker}`,
        job_description: `Test JD ${marker}`,
        job_posting_url: `http://test.com/job/${marker}`,
        application_date: marker,
        status: 'applied'
      })
    });
    const newApplication = await postRes.json();
    applicationId = newApplication.data.id;
  });

  test('Add a new interview', async () => {
    const timestamt = Date.now();
    const newInterviewRes = await app.request('/api/interviews', {
      method: 'POST',
      body: JSON.stringify({
        application_id: applicationId,
        interview_date: timestamt,
        topic: 'Intro call',
        participants: 'John Doe',
        prep_notes: 'Stay calm'
      })
    });
    expect(newInterviewRes.status).toEqual(200);

    const checkRes = await app.request(`/api/applications/${applicationId}`);
    const checkData = await checkRes.json();
    expect(checkData.data.interviews).toMatchObject([
      {
        application_id: expect.any(String),
        id: expect.any(String),
        interview_date: timestamt,
        participants: "John Doe",
        prep_notes: "Stay calm",
        topic: "Intro call",
      }
    ]);
  });

  test('Update an existing interview', async () => {
    const timestamt = Date.now();
    const newInterviewRes = await app.request('/api/interviews', {
      method: 'POST',
      body: JSON.stringify({
        application_id: applicationId,
        interview_date: timestamt,
        topic: 'Intro call',
        participants: 'John Doe',
        prep_notes: 'Stay calm'
      })
    });
    expect(newInterviewRes.status).toEqual(200);
    const interview = await newInterviewRes.json();

    const updateRes = await app.request(`/api/interviews/${interview.data.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        id: interview.data.id,
        interview_date: interview.data.interview_date,
        application_id: applicationId,
        topic: 'New topic',
        participants: 'New participants',
        prep_notes: 'New notes'
      })
    });
    expect(updateRes.status).toEqual(200);

    const checkRes = await app.request(`/api/applications/${applicationId}`);
    const checkData = await checkRes.json();
    const { interviews } = checkData.data;
    expect(interviews).toContainEqual({
      application_id: applicationId,
      id: interview.data.id,
      interview_date: timestamt,
      topic: 'New topic',
      participants: 'New participants',
      prep_notes: 'New notes'
    });
  });
});