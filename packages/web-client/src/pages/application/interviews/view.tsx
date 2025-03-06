import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router'
import { addInterviewComment, interviewDetailsQueryOptions } from '../../../lib/api';
import { printDate } from '../../../utils';
import { useEffect, useState } from 'react';
import { Banner } from '../../../components/banner';
import { CaseEmpty } from '../../../lib/case';
import InterviewCommentForm from '../../../components/comment_form';


const CommentActionNone = () => new CaseEmpty('none' as const);
const CommentActionAdd = () => new CaseEmpty('add' as const);

type CommentAction =
  | ReturnType<typeof CommentActionNone>
  | ReturnType<typeof CommentActionAdd>

const InterviewView = () => {
  const { interview_id } = useParams();
  const queryClient = useQueryClient();

  const [commentAction, setCommentAction] = useState<CommentAction>(CommentActionNone());
  const [isInterviewCommentFormBusy, setIsInterviewCommentFormBusy] = useState(false);

  const interviewQuery = useQuery(interviewDetailsQueryOptions(interview_id!));

  const addCommentMutation = useMutation({
    mutationFn: addInterviewComment,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: [`interview.${interview_id}`] });
      setCommentAction(CommentActionNone())
    },
    onError: (error: unknown) => {
      console.error(error);
      setCommentAction(CommentActionNone())
    },
  })

  if (interviewQuery.isLoading || !interviewQuery.data) {
    return <div>Loading...</div>
  }

  if (interviewQuery.error || 'error' in interviewQuery.data) {
    return <div>Error: <pre>{String(interviewQuery.error)}</pre></div>
  }

  const interview = interviewQuery.data.data;


  return (
    <>

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
          {interview.comments.length === 0 ? <Banner>No comments added yet</Banner> :
            interview.comments.map(comment => {
              return <li className='bg-neutral-100 p-3 rounded-md' key={comment.id}>{comment.comment}</li>
            })}
        </ul>

        <button className='btn green mt-4 mx-auto block' onClick={() => { setCommentAction(CommentActionAdd()) }}>Add comment</button>
      </section>

      {commentAction._kind === 'add' && <InterviewCommentForm
        mode="add"
        interview_id={interview_id!}
        isBusy={isInterviewCommentFormBusy}
        onSubmit={formData => {
          console.log(formData)
          setIsInterviewCommentFormBusy(true);
          addCommentMutation.mutate({ id: interview_id!, json: formData })
        }}
        onCancel={() => {
          setCommentAction(CommentActionNone());
        }}
      />}

      {/* TODO: Handle edit comment */}
    </>
  )
}

export default InterviewView