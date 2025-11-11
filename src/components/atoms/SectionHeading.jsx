import { ArrowRight } from "lucide-react";
import Link from "next/link";
import React from "react";

const SectionHeading = ({ title, subtitle, link, linkHref, linkLabel }) => {
    return (
        <>
            <div className="flex w-full items-center justify-between">
                <div className="flex flex-col gap-2 w-fit">
                    <h2 className="text-lg font-medium md:text-xl lg:text-2xl flex flex-col w-fit">
                        <span>{title}</span>
                        <span className="h-1.5 w-20 bg-[#EDB015] rounded-full"></span>
                    </h2>
                    {subtitle ? (
                        <span className="text-sm text-gray-500 font-medium md:text-sm lg:text-sm flex flex-col w-fit">
                            {subtitle}
                        </span>
                    ) : (
                        ""
                    )}
                </div>
                {link ? (
                    <Link
                        href={linkHref}
                        className="flex items-center gap-2 hover:text-black text-[#6f272b] text-lg md:text-xl"
                    >
                        <span className="hidden md:flex">{linkLabel}</span>
                        <ArrowRight />
                    </Link>
                ) : (
                    ""
                )}
            </div>
        </>
    );
};

export default SectionHeading;
