import UseCaseClient, { UseCaseClientDesktopMobileProps } from './UseCaseClient';
import { UseCaseTitle } from './UseCaseTitle';
import { UseCaseTitleMobile } from './UseCaseTitleMobile';

export default function UseCaseServer() {
    const useCaseProps: UseCaseClientDesktopMobileProps = {
        desktop: { title: <UseCaseTitle /> },
        mobile: { title: <UseCaseTitleMobile /> }
    }
    return <UseCaseClient desktop={useCaseProps.desktop} mobile={useCaseProps.mobile} />;
}
