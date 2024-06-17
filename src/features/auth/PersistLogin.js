import { Outlet, Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useRefreshMutation } from "./authApiSlice";
import usePersist from "../../hooks/usePersist";
import { useSelector } from "react-redux";
import { selectCurrentToken } from "./authSlice";

const PersistLogin = () => {
  const [persist] = usePersist();
  const token = useSelector(selectCurrentToken);
  //for hadling react strict mode
  const effectRan = useRef(false);

  const [trueSuccess, setTrueSuccess] = useState(false);

  const [refresh, { isUninitialized, isLoading, isSuccess, isError, error }] =
    useRefreshMutation();

  useEffect(() => {
    if (effectRan.current === true || process.env.NODE_ENV !== "development") {
      //React 18 Strict Mode

      const verifyRefreshToken = async () => {
        console.log("verifying refresh tokens");
        try {
          await refresh();
          setTrueSuccess(true);
        } catch (err) {
          console.log(err);
        }
      };
      if (!token && persist) verifyRefreshToken();
    }

    return () => (effectRan.current = true);
    // eslint-disable-next-line
  }, []);

  let content;
  if (!persist) {
    //no persist
    console.log("no persits");
    content = <Outlet />;
  } else if (isLoading) {
    //perist: yes, token: no
    console.log("loading");
    content = <p>Loading...</p>;
  } else if (isError) {
    //persit: yes, token: no
    console.log(error);
    content = (
      <p className="errmsg">
        {error.data?.message}
        <Link to="/login">Please login again</Link>
      </p>
    );
  } else if (isSuccess && trueSuccess) {
    //persist: yes, token: yes
    console.log("success");
    content = <Outlet />;
  } else if (token && isUninitialized) {
    //persist: yes, token: yes
    console.log("token and uninit");
    console.log(isUninitialized);
    content = <Outlet />;
  }

  return content
};

export default PersistLogin;
