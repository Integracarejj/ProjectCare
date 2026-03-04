import './AppHeader.css'
import { QuickActions } from '../QuickActions/QuickActions'

type AppHeaderProps = {
    title: string
}

export function AppHeader({ title }: AppHeaderProps) {
    return (
        <header className="pcHeader">
            <div className="pcHeader__inner">
                <div className="pcHeader__brand">
                    <a
                        className="pcHeader__homeLink"
                        href="/projects"
                        aria-label="ProjectCare home"
                    >
                        <img
                            src="/logo/ProjectCare_logo1.png"
                            alt="ProjectCare"
                            className="pcHeader__logo"
                        />
                    </a>

                    <div className="pcHeader__pageLabel">{title}</div>
                </div>

                <div className="pcHeader__right" aria-label="Header actions">
                    <QuickActions />
                </div>
            </div>
        </header>
    )
}