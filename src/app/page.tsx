"use client";
import Image from "next/image";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

export default function Home() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [imageData, setImageData] = useState<any>(null);
  const [imageFile, setImageFile] = useState<any>();

  const submitToApi = async (data: any) => {
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const { taskId } = await response.json();
      console.log(taskId, " task id from page");
      if (taskId) {
        pollForResult(taskId);
      }
    } catch (error) {
      console.error("Error submitting data:", error);
    }
  };

  async function pollForResult(taskId: string) {
    const statusResponse = await fetch(`/api/status?taskId=${taskId}`);
    const status = await statusResponse.json();
    console.log("STATUS from poll for result", statusResponse);
    if (status.completed) {
      const img = document.createElement("img");
      img.src = status.filePath;
      document.body.appendChild(img);
    } else if (status.failed) {
      console.error("processing failed: ", status.error);
    } else {
      setTimeout(() => {
        pollForResult(taskId);
      }, 5000);
    }
  }

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
            const preview = URL.createObjectURL(file);

            setImageData(image);
            setImageFile({ preview, file });
          };
          reader.readAsDataURL(file);
        } catch (err: any) {
          toast.error(err.message);
        } finally {
          setIsLoading(false); // Reset loading state
        }
      },
    });
  const form = useForm({
    mode: "onChange",
  });
  const { register, control, handleSubmit, formState } = form;

  const onSubmit = async () => {
    const data: any = {};
    if (imageFile) {
      // convert the image file to a base64 string
      const reader = new FileReader();
      reader.readAsDataURL(imageFile.file);
      reader.onloadend = async () => {
        data["imageData"] = reader.result;
        console.log(data);

        await submitToApi(data);
      };

      reader.onerror = () => {
        console.error("error reading file");
      };
    } else {
      console.error("No image file selected");
    }

    // const formData = new FormData();
    // formData.append("image", imageFile);
    // console.log("imageData ", imageFile);

    // console.log("formdata ", formData);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <button type="submit">
          <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
            Greyscale your image!
          </p>
        </button>
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
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt=""
            src={imageFile.preview}
            width={300}
            height={300}
            onLoad={() => {
              URL.revokeObjectURL(imageFile.preview);
            }}
          />
        ) : (
          <></>
        )}
        <p>{acceptedFiles[0]?.name}</p>
      </form>
    </main>
  );
}
