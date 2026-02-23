"use client";

import React from "react";

export const BackgroundGradients = React.memo(function BackgroundGradients() {
    return (
        <>
            <div
                className="absolute top-0 right-0 -z-10 h-96 w-96 bg-gradient-to-br from-purple-200/40 via-orange-100/20 to-blue-200/30 blur-[100px]"
                style={{ willChange: "filter", transform: "translateZ(0)" }}
            />
            <div
                className="absolute bottom-0 left-0 -z-10 h-80 w-80 bg-gradient-to-tr from-blue-100/30 via-purple-100/20 to-orange-100/30 blur-[80px]"
                style={{ willChange: "filter", transform: "translateZ(0)" }}
            />
        </>
    );
});
