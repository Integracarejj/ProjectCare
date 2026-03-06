import './AppHeader.css'
import { QuickActions } from '../QuickActions/QuickActions'
import { useAuth } from '../../auth/AuthContext'

type AppHeaderProps = {
    title: string
}

export function AppHeader({ title }: AppHeaderProps) {
    const { user, roles, logout } = useAuth()
    const primaryRole = roles?.[0] ?? ''

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
                    {/* Existing quick actions (unchanged) */}
                    <QuickActions />

                    {/* User lens (new) */}
                    {user ? (
                        <div className="pcHeader__userArea" aria-label="Signed in user">
                            <div className="pcHeader__userText">
                                <span className="pcHeader__userName">{user.displayName}</span>
                                {primaryRole ? (
                                    <span className="pcHeader__userRole"> · {primaryRole}</span>
                                ) : null}
                            </div>

                            <button
                                type="button"
                                className="pcHeader__logout"
                                onClick={logout}
                                aria-label="Log out"
                            >
                                Log out
                            </button>
                        </div>
                    ) : null}
                </div>
            </div>
        </header>
    )
}