"use client"

import { ApiReferenceReact } from "@scalar/api-reference-react"
import "@scalar/api-reference-react/style.css"
import "./scalar-notion.css"

export default function ApiDocsPage() {
    return (
        <div className="docs-shell">
            <ApiReferenceReact
                configuration={{
                    sources: [
                        {
                            title: "Auth Service",
                            // url: "http://localhost:9000/docs/auth/v3/api-docs",
                            url: "https://mockio.cloud/docs/auth/v3/api-docs",
                        },
                        {
                            title: "Core Service",
                            // url: "http://localhost:9000/docs/core/v3/api-docs",
                            url: "https://mockio.cloud/docs/core/v3/api-docs",
                        },
                        {
                            title: "Support Service",
                            // url: "http://localhost:9000/docs/support/v3/api-docs",
                            url: "https://mockio.cloud/docs/support/v3/api-docs",
                        },
                    ],
                    theme: "default",
                    hiddenClients: true,
                    hideDownloadButton: true,
                    hideTestRequestButton: true,
                }}
            />
        </div>
    )
}