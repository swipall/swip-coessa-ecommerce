import type {Metadata} from "next";
import { HomePageComponent } from "@/components/layout/home/home-page-component";
import {SITE_NAME, SITE_URL, buildCanonicalUrl} from "@/lib/metadata";

export const metadata: Metadata = {
    title: {
        absolute: `${SITE_NAME} - Industria del descanso. Fabricación de colchones`,
    },
    description:
        "Fabricante mexicano con más de 25 años, enfocada en diseñar y producir colchones con distintos materiales y tecnologías.",
    alternates: {
        canonical: buildCanonicalUrl("/"),
    },
    openGraph: {
        title: `${SITE_NAME} - Industria del descanso. Fabricación de colchones`,
        description:
            "Fabricante mexicano con más de 25 años, enfocada en diseñar y producir colchones con distintos materiales y tecnologías",
        type: "website",
        url: SITE_URL,
    },
};

export default async function Home(_props: PageProps<'/'>) {
    return (
        <HomePageComponent />
    );
}
