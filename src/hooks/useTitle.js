import { useEffect } from "react";

const useTitle = (title) => {
    useEffect(()=>{
        const prevTitle = document.title
        document.title = title

        //clean up function, that sets title to previous title when component is unmounted
        return ()=> document.title = prevTitle
      },[title])
}

export default useTitle