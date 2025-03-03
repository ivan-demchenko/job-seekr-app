import { describe, test, expect, beforeAll } from 'bun:test';
import { app } from '../src/main';
import type { NewApplicationModel } from '@job-seekr/data/validation';

describe('Create applications', () => {

  /**
   * This is used to make entities unique
   */
  const marker = Date.now();

  /**
   * Create a single application and work with it in different test cases.
   */
  let applicationId: string | null = null;

  beforeAll(async () => {
    // Each test case will need an application.
    // If there's one already, we don't need to create another one.
    if (applicationId) {
      return applicationId;
    }
    const postRes = await app.request('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company: `Test company ${marker}`,
        position: `Test position ${marker}`,
        job_description: `Test JD ${marker}`,
        job_posting_url: `http://test.com/job/${marker}`,
        application_date: marker,
        status: 'applied'
      } as NewApplicationModel)
    });
    const newApplication = await postRes.json();
    expect(postRes.status).toEqual(200);

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
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
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

describe('Delete applications', async () => {
  test('it can delete an application', async () => {
    const marker = Date.now();

    const postRes = await app.request('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company: `Test company ${marker}`,
        position: `Test position ${marker}`,
        job_description: `Test JD ${marker}`,
        job_posting_url: `http://test.com/job/${marker}`,
        application_date: marker,
        status: 'applied'
      } as NewApplicationModel)
    });
    const newApplication = await postRes.json();
    expect(postRes.status).toEqual(200);

    const deleteRes = await app.request(`/api/applications/${newApplication.data.id}`, {
      method: 'DELETE'
    });
    expect(deleteRes.status).toEqual(200);

    const check2Res = await app.request(`/api/applications/${newApplication.data.id}`);
    expect(check2Res.status).toEqual(404);
  });

  test('it can delete all applications for a user', async () => {
    const deleteRes = await app.request(`/api/applications/of-user`, {
      method: 'DELETE'
    });
    expect(deleteRes.status).toEqual(200);

    const checkRes = await app.request(`/api/applications`);
    const checkData = await checkRes.json();
    expect(checkData).toMatchObject({
      data: []
    })
  });
});