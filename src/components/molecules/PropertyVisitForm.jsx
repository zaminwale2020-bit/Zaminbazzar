"use client";

import { createPropertyVisit } from "@/actions/property";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import Loading from "../atoms/Loading";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useRouter } from "next/navigation";

const formSchema = z.object({
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
    visitAt: z.date({
        required_error: "Date is required.",
    }),
});

const PropertyVisitForm = ({ propertyId, uid }) => {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {},
    });

    const onSubmit = async (values) => {
        console.log(values);

        setLoading(true);
        try {
            let body = { ...values, uid };
            const resp = await createPropertyVisit({ body, propertyId });
            setLoading(false);
            form.reset();
            router.push("/thank-you");
            toast.success(resp.message);
        } catch (error) {
            setLoading(false);
            toast.error(error.message);
        }
    };

    return (
        <div className="w-full">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-3"
                >
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fullname</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter your fullname"
                                        {...field}
                                        value={field.value || ""}
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
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter your Email"
                                        {...field}
                                        value={field.value || ""}
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
                            <FormItem>
                                <FormLabel>Mobile</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter your mobile no."
                                        {...field}
                                        value={field.value || ""}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="visitAt"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Schedule Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value &&
                                                        "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, "PP")
                                                ) : (
                                                    <span>Select Date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-auto p-0"
                                        align="start"
                                    >
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    
                    <Button className="rounded-3xl w-full bg-[#EDB015]">
                        {loading ? <Loading /> : "Submit"}
                    </Button>
                    
                </form>
            </Form>
        </div>
    );
};

export default PropertyVisitForm;
