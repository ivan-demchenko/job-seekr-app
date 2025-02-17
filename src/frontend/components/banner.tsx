type Props = {
  message: string;
}
export function Banner({ message }: Props) {
  return (
    <div className="m-4 max-w-5xl p-6 shadow-xl rounded-xl mx-auto">
      {message}
    </div>
  );
}