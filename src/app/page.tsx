"use client";
import Image from "next/image";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";

export default function Home() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [imageData, setImageData] = useState<any>(null);
  const [imageFile, setImageFile] = useState<any>();

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
    useDropzone({
      accept: {
        "image/jpeg": [],
        "image/png": [],
      },
      maxFiles: 1,
      onDrop: async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        const fileName = file.name; // Get the filename
        setImageFile(
          acceptedFiles.map((file) =>
            Object.assign(file, {
              preview: URL.createObjectURL(file),
            })
          )
        );

        if (file.size > 100 * 1024 * 1024) {
          toast.error("Error: File bigger than 100mb.");
          return;
        }

        try {
          setIsLoading(true); // Set loading state
          const reader = new FileReader();
          reader.onabort = () => console.log("file reading was aborted");
          reader.onerror = () => console.log("file reading failed");
          reader.onload = () => {
            // do whatever you want with the file contents
            const image = reader.result;
            setImageData(image);
            setImageFile(file);
          };
          reader.readAsDataURL(file);
        } catch (err: any) {
          toast.error(err.message);
        } finally {
          setIsLoading(false); // Reset loading state
        }
      },
    });

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
        Greyscale your image!
      </p>
      <div className="p-2 rounded-xl ">
        <div
          {...getRootProps({
            className:
              "border-dashed grow border-2 rounded-xl cursor-pointer bg-gray-50 py-8 flex justify-center items-center flex-col",
          })}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <>
              <p className="text-gray-500 font-bold py-2">
                Drop your file here
              </p>
              <div className="mt-2 text-sm text-slate-400">
                <p>1. Only upload jpg or png</p>
                <br></br>
              </div>
            </>
          ) : (
            <>
              <input {...getInputProps()} />
              <p className="text-gray-500 py-2 px-2">
                Drag image here, or click to Browse
              </p>
              <div className="mt-2 text-sm text-slate-400">
                <p>Only upload jpg or png</p>
                <br></br>
              </div>
            </>
          )}{" "}
          {isLoading && (
            <>
              {/* loading state */}
              <p className="mt-t text-sm text-slate-400">Checking file...</p>
            </>
          )}
        </div>
      </div>
      {acceptedFiles[0] ? (
        <Image
          alt=""
          src={imageFile.preview}
          width={300}
          height={300}
          style={{
            objectFit: "contain",
            maxWidth: "300px",
            maxHeight: "300px",
          }}
          onLoadingComplete={() => {
            URL.revokeObjectURL(imageFile.preview);
          }}
        />
      ) : (
        <></>
      )}
      <p>{acceptedFiles[0]?.name}</p>
    </main>
  );
}
