export default function LoadingMessage() {
  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] p-3 rounded-lg bg-gray-100">
        <div className="flex space-x-2">
          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-100"></div>
          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-200"></div>
        </div>
      </div>
    </div>
  );
}
