import { STEPS } from "../../lib/constants";

interface Props {
  currentStep: STEPS;
}
export default function Progress(props: Props) {
  const { currentStep } = props;

  const steps = [
    STEPS.WHAT,
    STEPS.WHERE,
    STEPS.WHEN,
    STEPS.CONFIRM,
    STEPS.COMPLETE,
  ];

  const currentIndex = steps.indexOf(currentStep);

  return (
    <div className="flex justify-between px-4 py-2 bg-gray-100">
      {steps.map((step, index) => (
        <div
          key={step}
          className={`flex flex-col items-center ${
            index == currentIndex
              ? "text-mtaBlueLine"
              : index < currentIndex
              ? "text-mtaGreenLine"
              : "text-gray-400"
          }`}
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              index < currentIndex || currentIndex == steps.length - 1
                ? "bg-mtaGreenLine text-white"
                : index === currentIndex
                ? "bg-mtaBlueLine text-white"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            {index + 1}
          </div>
          <span className="text-xs mt-1">{step}</span>
        </div>
      ))}
    </div>
  );
}
