import { Stethoscope, FlaskConical, Lock, FileText } from 'lucide-react';

const items = [
  { icon: <Stethoscope className="w-4 h-4 text-teal-400" />, label: 'Built by 3 Psychiatrists' },
  { icon: <FlaskConical className="w-4 h-4 text-teal-400" />, label: 'Science-Backed Insights' },
  { icon: <Lock className="w-4 h-4 text-teal-400" />, label: 'Private & Secure' },
  { icon: <FileText className="w-4 h-4 text-teal-400" />, label: 'Clinician-Approved Reports' },
];

export default function TrustBar() {
  return (
    <div className="bg-gray-900 py-5">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-4 text-white text-sm">
          {items.map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-2 font-medium">
              {icon}
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}