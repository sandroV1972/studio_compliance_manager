"use client";

import { Check, X } from "lucide-react";
import { useMemo } from "react";

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
  met: boolean;
}

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({
  password,
}: PasswordStrengthIndicatorProps) {
  const requirements: PasswordRequirement[] = useMemo(() => {
    return [
      {
        label: "Almeno 12 caratteri",
        test: (pwd) => pwd.length >= 12,
        met: password.length >= 12,
      },
      {
        label: "Almeno una lettera maiuscola (A-Z)",
        test: (pwd) => /[A-Z]/.test(pwd),
        met: /[A-Z]/.test(password),
      },
      {
        label: "Almeno una lettera minuscola (a-z)",
        test: (pwd) => /[a-z]/.test(pwd),
        met: /[a-z]/.test(password),
      },
      {
        label: "Almeno un numero (0-9)",
        test: (pwd) => /\d/.test(pwd),
        met: /\d/.test(password),
      },
      {
        label: "Almeno un carattere speciale (!@#$%^&* etc.)",
        test: (pwd) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
        met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      },
    ];
  }, [password]);

  const metRequirements = requirements.filter((req) => req.met).length;
  const totalRequirements = requirements.length;
  const percentage = (metRequirements / totalRequirements) * 100;

  // Calcola la forza della password
  const getStrengthColor = () => {
    if (percentage === 0) return "bg-gray-200";
    if (percentage < 40) return "bg-red-500";
    if (percentage < 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthLabel = () => {
    if (percentage === 0) return "";
    if (percentage < 40) return "Debole";
    if (percentage < 80) return "Media";
    return "Forte";
  };

  return (
    <div className="space-y-3">
      {/* Barra di forza password */}
      {password.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Sicurezza password:</span>
            <span className="font-medium text-gray-900">
              {getStrengthLabel()}
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${getStrengthColor()}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Lista requisiti */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs font-semibold text-blue-900 mb-2">
          Requisiti password:
        </p>
        <ul className="space-y-1.5">
          {requirements.map((req, index) => (
            <li key={index} className="flex items-start gap-2 text-xs">
              {req.met ? (
                <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <X className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
              )}
              <span className={req.met ? "text-green-700" : "text-gray-600"}>
                {req.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
