import Image from "next/image";

const Loading: React.FC = () => {
  return (
    <div className="loader-container min-h-screen flex justify-center items-center text-xl sm:text-2xl bg-[#0A0A0A] text-white">
      <Image src="/loading.gif" alt="Loading..." width={200} height={200} />
    </div>
  );
};

export default Loading;
