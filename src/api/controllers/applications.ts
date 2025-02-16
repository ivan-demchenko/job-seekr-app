import { getAllApplications, addApplication, getApplicationById } from '../repository/applications';

export function getAll() {
  const records = getAllApplications();
  if (records.isErr()) {
    console.error(`Failed to fetch all applications: ${records.error}`);
    return [];
  }
  return records.value;
}

export function getById(id: string) {
  const application = getApplicationById(id);
  if (application.isErr()) {
    console.error(`Failed to fetch an application: ${application.error}`);
    return null;
  }
  return application.value;
}

export function addNewApplication(payload: any) {
  const record = {
    id: Bun.randomUUIDv7(),
    status: 'applied',
    application_date: new Date().toISOString(),
    ...payload
  }
  addApplication(record);
  return record;
}