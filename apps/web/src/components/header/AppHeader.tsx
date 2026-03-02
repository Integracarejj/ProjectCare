import './AppHeader.css'

type AppHeaderProps = {
    title: string
}

export function AppHeader({ title }: AppHeaderProps) {
    return (
        <header className="pcHeader">
            <div className="pcHeader__inner pc-container">
                <div className="pcHeader__brand">
                    <a href="/operational-hub" className="pcHeader__brandLink">
                        <img
                            src="/logo/ProjectCare_logo1.png"
                            alt="ProjectCare"
                            className="pcHeader__logo"
                        />
                    </a>
                </div>

                <div className="pcHeader__context">
                    <span className="pcHeader__pageLabel">{title}</span>
                </div>
            </div>
        </header>
    )
}