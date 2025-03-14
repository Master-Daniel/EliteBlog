const DataTableLoader = ({ text }: { text: string }) => (
    <div className="p-6 flex flex-col items-center">
        <div className="loading"></div>
        <div className="text-center mt-4">{text}...</div>
    </div>
);

export default DataTableLoader;
