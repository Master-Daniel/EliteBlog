import Select from "react-select";
import { useField, useFormikContext } from "formik";

interface CategoryOption {
    value: string;
    label: string;
}

interface CategorySelectProps {
    name: string;
    categories?: { id: string, name: string }[];
}

const CategorySelect: React.FC<CategorySelectProps> = ({ name, categories = [] }) => {
    const [field] = useField(name); 
    const { setFieldValue } = useFormikContext(); 

    // Ensure categories is always an array
    const categoryOptions: CategoryOption[] = categories.map(category => ({
        value: category.id,
        label: category.name,
    }));

    const handleChange = (selectedOption: CategoryOption | null) => {
        setFieldValue(name, selectedOption ? selectedOption.value : "");
    };

    return (
        <div className="space-y-2">
            <label htmlFor={name} className="block font-medium">Category</label>
            <Select
                id={name}
                name={name}
                options={categoryOptions}
                value={categoryOptions.find(option => option.value === field.value) || null}
                onChange={handleChange}
                placeholder="Select a category"
                isClearable
                className="react-select-container"
                classNamePrefix="react-select"
            />
        </div>
    );
};

export default CategorySelect;
