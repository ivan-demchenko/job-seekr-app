import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router'
import { interviewDetailsQueryOptions } from '../../../lib/api';
import { printDate } from '../../../utils';

const InterviewView = () => {
  const {interview_id} = useParams();

  const interviewQuery = useQuery(interviewDetailsQueryOptions(interview_id!));

  
   if (interviewQuery.isLoading || !interviewQuery.data) {
    return <div>Loading...</div>
  }

  if (interviewQuery.error || 'error' in interviewQuery.data) {
    return <div>Error: <pre>{String(interviewQuery.error)}</pre></div>
  }

  const interview = interviewQuery.data.data;
  console.log(interview)

  return (
    <section>
      <h1 className="text-center font-bold text-2xl mb-4">
        {interview.topic}
        </h1>



          <dl className="def-list">

            <dt>Interview Date</dt>

          <dd>{printDate(interview.interview_date)}</dd>
            <dt>Topic</dt>
            <dd>{interview.topic}</dd>

            <dt>Participants</dt>
            <dd>{interview.participants}</dd>

            <dt>Prep notes</dt>
            <dd>{interview.prep_notes}</dd>
        </dl>


<div className='mt-5'>
<h2 className='font-semibold text-lg '>Comments</h2>
</div>
        <ul className='space-y-2'>
          {interview.comments.map(comment => {
            return <li className='bg-neutral-100 p-3 rounded-md' key={comment.id}>{comment.comment}</li>
          })}
        </ul>

    </section>
  )
}

export default InterviewView