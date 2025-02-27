import { describe, test, expect, beforeAll } from 'bun:test';
import { app } from '../src/main';

describe('Applications', () => {
  const marker = Date.now();
  let applicationId: string | null = null;
  beforeAll(async () => {
    if (applicationId) {
      return applicationId;
    }
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
    expect(postRes.status).toEqual(200);
    const newApplication = await postRes.json()
    applicationId = newApplication.data.id;
    expect(newApplication.data).toMatchObject({
      company: `Test company ${marker}`,
      position: `Test position ${marker}`,
      job_description: `Test JD ${marker}`,
      job_posting_url: `http://test.com/job/${marker}`,
      application_date: marker,
      status: 'applied'
    });
  });

  test('Add a new application', async () => {
    const checkRes = await app.request(`/api/applications/${applicationId}`);
    const checkData = await checkRes.json()
    expect(checkData.data.application).toMatchObject({
      id: applicationId,
      company: `Test company ${marker}`,
      position: `Test position ${marker}`,
      job_description: `Test JD ${marker}`,
      job_posting_url: `http://test.com/job/${marker}`,
      application_date: marker,
      status: 'applied',
      user_id: "local-user",
    });
  });

  test('Update the job description', async () => {
    const updateJDReq = await app.request(`/api/applications/${applicationId}`, {
      method: 'PUT',
      body: JSON.stringify({
        target: 'job_description',
        job_description: 'A new JD'
      })
    });

    expect(updateJDReq.status).toEqual(200);

    const checkRes = await app.request(`/api/applications/${applicationId}`);
    const checkData = await checkRes.json();
    expect(checkData.data.application).toMatchObject({
      id: applicationId,
      job_description: `A new JD`
    });
  });

  test('Update the status', async () => {
    const updateJDReq = await app.request(`/api/applications/${applicationId}`, {
      method: 'PUT',
      body: JSON.stringify({
        target: 'status',
        status: 'offer'
      })
    });

    expect(updateJDReq.status).toEqual(200);

    const checkRes = await app.request(`/api/applications/${applicationId}`);
    const checkData = await checkRes.json();
    expect(checkData.data.application).toMatchObject({
      id: applicationId,
      status: `offer`
    });
  });
});