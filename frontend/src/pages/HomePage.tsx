import FileUpload from "@/components/FileUpload";
import ImportDropdown from '../components/Drop';

const HomePage = () => {
  const handleImport = (sheet: string) => {
    if (!sheet) {
      alert("Please select a sheet to import.");
      return;
    }
    console.log(`Importing sheet: ${sheet}`);
    // API call or processing logic can be added here
  };

  return (
    <div className="home-page h-full gap-12  w-full flex flex-col  md:flex-row p-5">
      <div className="flex flex-col items-center placeholder min-w-[20vw] ">
        <h1 className="text-3xl font-bold p-4">Welcome User!</h1>
        <FileUpload />
      </div>
      <div className="flex flex-col  w-full">
          <ImportDropdown onImport={handleImport} />
      </div>
    </div>
  );
}

export default HomePage;
