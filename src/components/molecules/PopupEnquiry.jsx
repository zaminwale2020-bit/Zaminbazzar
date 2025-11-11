"use client";

import { createWebsiteEnquiry } from "@/actions/property";
import useZaminwaleStore from "@/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import Loading from "../atoms/Loading";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { useRouter } from "next/navigation";

const EnquireFormSchema = z.object({
    name: z
        .string()
        .min(2, {
            message: "Fullname must be at least 2 characters.",
        })
        .regex(/^[A-Za-z\s]+$/, "Only alphabets are allowed."),
    mobileNo: z
        .string()
        .min(10, {
            message: "Mobile No must be at least 10 Digit.",
        })
        .max(10, {
            message: "Mobile No must be at Max 10 Digit.",
        }),
    email: z.string().email(),
    advertisement: z.string(),
});

const PopupEnquiry = () => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const popupEnquiry = useZaminwaleStore((store) => store.popupEnquiry);
    const dispatch = useZaminwaleStore((store) => store.dispatch);

    const form = useForm({
        resolver: zodResolver(EnquireFormSchema),
        defaultValues: {} || "",
    });

    const onSubmit = async (values) => {
        setLoading(true);
        try {
            const resp = await createWebsiteEnquiry(values);
            setLoading(false);
            form.reset();
            router.push("/thank-you");
            toast.success(resp.message);
            dispatch({
                type: "SET_STATE",
                payload: { popupEnquiry: false },
            });
        } catch (error) {
            setLoading(false);
            toast.error(error.message);
        }
        setOpen(false);
    };

    useEffect(() => {
        if (popupEnquiry === true) {
            let onloadTimer;
            onloadTimer = setTimeout(() => {
                setOpen(true);
            }, 1000 * 15);
            return () => clearTimeout(onloadTimer);
        } else null;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [popupEnquiry]);

    return (
        <>
            <Dialog open={open} onOpenChange={() => setOpen(false)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Connect with Us for Enquiry</DialogTitle>
                    </DialogHeader>
                    <div className="w-full p">
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-4"
                            >
                                <div className="w-full space-y-2 py-2">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem className="w-full">
                                                <FormLabel>Name</FormLabel>
                                                <FormControl className="w-full">
                                                    <Input
                                                        placeholder="Enter Your Name"
                                                        {...field}
                                                        value={
                                                            field.value || ""
                                                        }
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="mobileNo"
                                        render={({ field }) => (
                                            <FormItem className="w-full">
                                                <FormLabel>
                                                    Mobile No.
                                                </FormLabel>
                                                <FormControl className="w-full">
                                                    <Input
                                                        type="number"
                                                        placeholder="Enter Your Mobile No"
                                                        {...field}
                                                        value={
                                                            field.value || ""
                                                        }
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem className="w-full">
                                                <FormLabel>Email</FormLabel>
                                                <FormControl className="w-full">
                                                    <Input
                                                        type="email"
                                                        placeholder="Enter Your Email Id"
                                                        {...field}
                                                        value={
                                                            field.value || ""
                                                        }
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="advertisement"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Where You See Property Ads
                                                </FormLabel>
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select Option" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="max-h-40">
                                                        {AdvertisementData.map(
                                                            (item, i) => (
                                                                <SelectItem
                                                                    key={i}
                                                                    value={
                                                                        item.value
                                                                    }
                                                                >
                                                                    {item.label}
                                                                </SelectItem>
                                                            )
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                               
                                <Button className="rounded-3xl w-full bg-[#EDB015]">
                                    {loading ? <Loading /> : "Submit"}
                                </Button>
                               
                            </form>
                        </Form>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default PopupEnquiry;

const AdvertisementData = [
    {
        label: "Google",
        value: "Google",
    },
    {
        label: "Facebook",
        value: "Facebook",
    },
    {
        label: "Instagram",
        value: "Instagram",
    },
    {
        label: "Youtube",
        value: "Youtube",
    },
    {
        label: "Train",
        value: "Train",
    },
    {
        label: "TV",
        value: "TV",
    },
    {
        label: "News Paper",
        value: "News Paper",
    },
    {
        label: "Hoarding",
        value: "Hoarding",
    },
];
