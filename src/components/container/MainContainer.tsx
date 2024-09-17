"use client";
interface MainContainerProps {
    children: React.ReactNode;
}

const MainContainer: React.FC<MainContainerProps> = ({
    children
}) => {
    return (
        <div className="pt-32 h-screen">
            {children}
        </div>
    );
}



export default MainContainer;