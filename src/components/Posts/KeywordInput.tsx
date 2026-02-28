import { useField } from "formik";
import { useState } from "react";

interface KeywordInputProps {
    name: string;
}

const KeywordInput: React.FC<KeywordInputProps> = ({ name }) => {
    const [field, meta, helpers] = useField(name); // Connect to Formik
    const [inputValue, setInputValue] = useState("");

    const handleAddKeyword = () => {
        const trimmedValue = inputValue.trim();
        if (trimmedValue) {
            helpers.setValue([...field.value, trimmedValue]); // Add to Formik state
        }
        setInputValue(""); // Clear input field
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === " " || e.key === ",") {
            e.preventDefault(); // Prevent form submission
            handleAddKeyword();
        }
        if (e.key === "Backspace" && inputValue === "" && field.value.length > 0) {
            // Remove last tag when Backspace is pressed with empty input
            helpers.setValue(field.value.slice(0, -1));
        }
    };

    const handleRemoveKeyword = (index: number) => {
        const updatedKeywords = field.value.filter((_: string, i: number) => i !== index);
        helpers.setValue(updatedKeywords);
    };

    return (
        <div className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 rounded w-full flex flex-wrap items-center gap-2 focus-within:ring focus-within:border-blue-300">
            {/* Display tags inside input */}
            {field.value.map((keyword: string, index: number) => (
                <div key={index} className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 h-8 px-2 py-1 rounded flex items-center space-x-1">
                    <span>{keyword}</span>
                    <button
                        type="button"
                        onClick={() => handleRemoveKeyword(index)}
                        className="ml-1 cursor-pointer text-red-500 hover:text-red-700 font-bold"
                    >
                        ×
                    </button>
                </div>
            ))}

            {/* Input field for entering keywords */}
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a keyword and press Space, Enter, or Comma"
                className="border-none outline-none flex-1 min-w-[100px] bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />

            {/* Validation error */}
            {meta.touched && meta.error ? (
                <div className="text-red-500 text-sm">{meta.error}</div>
            ) : null}
        </div>
    );
};

export default KeywordInput;
